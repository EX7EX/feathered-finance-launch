// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OrderBook is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum OrderType { Buy, Sell }
    enum OrderStatus { Open, Filled, Cancelled }

    struct Order {
        uint256 id;
        address owner;
        OrderType orderType;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 filledAmountA;
        uint256 expiry;
        OrderStatus status;
    }

    uint256 private nextOrderId;
    mapping(uint256 => Order) public orders;
    // Track order IDs per pair instead of copying structs
    mapping(address => mapping(address => uint256[])) private orderIds;

    address public operator;

    event OrderCreated(uint256 indexed id, address indexed owner, OrderType orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 expiry);
    event OrderCancelled(uint256 indexed id);
    event OrderFilled(uint256 indexed id);
    event TradeExecuted(uint256 indexed buyOrderId, uint256 indexed sellOrderId, uint256 amountA, uint256 amountB);

    modifier onlyOperator() {
        require(msg.sender == operator, "Not the operator");
        _;
    }

    constructor() {
        operator = msg.sender;
    }

    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
    }

    function createOrder(
        OrderType orderType,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 expiry
    ) external nonReentrant {
        require(amountA > 0 && amountB > 0, "Amounts must be > 0");
        require(tokenA != tokenB, "Tokens must differ");
        require(expiry == 0 || expiry > block.timestamp, "Invalid expiry");

        if (orderType == OrderType.Buy) {
            IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        } else {
            IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        }

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            owner: msg.sender,
            orderType: orderType,
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            amountB: amountB,
            filledAmountA: 0,
            expiry: expiry,
            status: OrderStatus.Open
        });

        orderIds[tokenA][tokenB].push(orderId);

        emit OrderCreated(orderId, msg.sender, orderType, tokenA, tokenB, amountA, amountB, expiry);
    }

    function getOrders(address tokenA, address tokenB) external view returns (Order[] memory) {
        uint256[] storage ids = orderIds[tokenA][tokenB];
        Order[] memory result = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
        return result;
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.owner == msg.sender, "Not your order");
        require(order.status == OrderStatus.Open, "Order not open");

        order.status = OrderStatus.Cancelled;

        if (order.orderType == OrderType.Buy) {
            IERC20(order.tokenB).safeTransfer(order.owner, order.amountB);
        } else {
            uint256 remaining = order.amountA - order.filledAmountA;
            IERC20(order.tokenA).safeTransfer(order.owner, remaining);
        }

        emit OrderCancelled(orderId);
    }

    function executeTrade(uint256 buyOrderId, uint256 sellOrderId) external onlyOperator nonReentrant {
        Order storage buyOrder = orders[buyOrderId];
        Order storage sellOrder = orders[sellOrderId];

        require(buyOrder.orderType == OrderType.Buy, "First must be buy");
        require(sellOrder.orderType == OrderType.Sell, "Second must be sell");
        require(buyOrder.status == OrderStatus.Open, "Buy order not open");
        require(sellOrder.status == OrderStatus.Open, "Sell order not open");
        require(buyOrder.tokenA == sellOrder.tokenA && buyOrder.tokenB == sellOrder.tokenB, "Pair mismatch");

        // Check expiry
        if (buyOrder.expiry > 0) require(block.timestamp <= buyOrder.expiry, "Buy order expired");
        if (sellOrder.expiry > 0) require(block.timestamp <= sellOrder.expiry, "Sell order expired");

        // Match amounts (exact match for now)
        require(buyOrder.amountA == sellOrder.amountA && buyOrder.amountB == sellOrder.amountB, "Amounts mismatch");

        buyOrder.status = OrderStatus.Filled;
        sellOrder.status = OrderStatus.Filled;
        buyOrder.filledAmountA = buyOrder.amountA;
        sellOrder.filledAmountA = sellOrder.amountA;

        // Execute swap
        IERC20(buyOrder.tokenB).safeTransfer(sellOrder.owner, buyOrder.amountB);
        IERC20(sellOrder.tokenA).safeTransfer(buyOrder.owner, sellOrder.amountA);

        emit TradeExecuted(buyOrderId, sellOrderId, sellOrder.amountA, buyOrder.amountB);
        emit OrderFilled(buyOrderId);
        emit OrderFilled(sellOrderId);
    }
}
