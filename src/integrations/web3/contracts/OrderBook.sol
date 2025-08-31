// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderBook {
    enum OrderType { Buy, Sell }

    struct Order {
        uint id;
        address owner;
        OrderType orderType;
        address tokenA; // Token being sold
        address tokenB; // Token being bought
        uint256 amountA; // Amount of tokenA being sold
        uint256 amountB; // Amount of tokenB being bought (price)
        bool isFilled;
        bool isCancelled;
    }

    uint private nextOrderId;
    mapping(uint => Order) public orders;
    mapping(address => mapping(address => Order[])) public orderBook;

    event OrderCreated(uint id, address owner, OrderType orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event OrderCancelled(uint id);
    event OrderFilled(uint id);

    function createOrder(OrderType orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB) public {
        // For a buy order, user needs to have tokenB and approve this contract to spend it
        // For a sell order, user needs to have tokenA and approve this contract to spend it
        if (orderType == OrderType.Buy) {
            require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Token B transfer failed");
        } else { // Sell order
            require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Token A transfer failed");
        }

        Order memory newOrder = Order({
            id: nextOrderId,
            owner: msg.sender,
            orderType: orderType,
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            amountB: amountB,
            isFilled: false,
            isCancelled: false
        });

        orders[nextOrderId] = newOrder;
        orderBook[tokenA][tokenB].push(newOrder);

        emit OrderCreated(nextOrderId, msg.sender, orderType, tokenA, tokenB, amountA, amountB);
        nextOrderId++;
    }

    function getOrders(address tokenA, address tokenB) public view returns (Order[] memory) {
        return orderBook[tokenA][tokenB];
    }

    function cancelOrder(uint orderId) public {
        Order storage order = orders[orderId];
        require(order.owner == msg.sender, "Not your order");
        require(!order.isFilled, "Order already filled");
        require(!order.isCancelled, "Order already cancelled");

        order.isCancelled = true;

        // Refund the tokens
        if (order.orderType == OrderType.Buy) {
            IERC20(order.tokenB).transfer(order.owner, order.amountB);
        } else {
            IERC20(order.tokenA).transfer(order.owner, order.amountA);
        }

        emit OrderCancelled(orderId);
    }

    address public operator;

    modifier onlyOperator() {
        require(msg.sender == operator, "Not the operator");
        _;
    }

    constructor() {
        operator = msg.sender;
    }

    function setOperator(address newOperator) public onlyOperator {
        operator = newOperator;
    }

    function executeTrade(uint buyOrderId, uint sellOrderId) public onlyOperator {
        Order storage buyOrder = orders[buyOrderId];
        Order storage sellOrder = orders[sellOrderId];

        // --- Sanity Checks ---
        require(buyOrder.orderType == OrderType.Buy, "First order must be a buy");
        require(sellOrder.orderType == OrderType.Sell, "Second order must be a sell");
        require(!buyOrder.isFilled && !sellOrder.isFilled, "One or both orders already filled");
        require(!buyOrder.isCancelled && !sellOrder.isCancelled, "One or both orders already cancelled");
        require(buyOrder.tokenA == sellOrder.tokenA && buyOrder.tokenB == sellOrder.tokenB, "Token pair mismatch");

        // For simplicity, this example assumes an exact match on amount and price.
        // A real-world engine would handle partial fills and price differences.
        require(buyOrder.amountA == sellOrder.amountA && buyOrder.amountB == sellOrder.amountB, "Order amounts/prices do not match");

        // --- Mark as Filled ---
        buyOrder.isFilled = true;
        sellOrder.isFilled = true;

        // --- Execute Token Swap ---
        // The contract already holds the tokens from when the orders were created.
        // Seller (sellOrder.owner) gets Token B from the buyer.
        IERC20(buyOrder.tokenB).transfer(sellOrder.owner, buyOrder.amountB);
        // Buyer (buyOrder.owner) gets Token A from the seller.
        IERC20(sellOrder.tokenA).transfer(buyOrder.owner, sellOrder.amountA);

        emit OrderFilled(buyOrderId);
        emit OrderFilled(sellOrderId);
    }
}
