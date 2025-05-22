import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWeb3 } from '../../integrations/web3/provider';
import { useTokenFactory } from '../../integrations/web3/hooks';
import styles from './TokenCreationForm.module.css';

const tokenSchema = z.object({
  name: z.string().min(3, 'Token name must be at least 3 characters'),
  symbol: z.string().min(2, 'Symbol must be at least 2 characters').max(5, 'Symbol must be at most 5 characters'),
  decimals: z.number().min(0).max(18),
  totalSupply: z.string().regex(/^\d+$/, 'Must be a valid number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website: z.string().url('Must be a valid URL').optional(),
  socialLinks: z.object({
    twitter: z.string().url('Must be a valid URL').optional(),
    telegram: z.string().url('Must be a valid URL').optional(),
    discord: z.string().url('Must be a valid URL').optional(),
  }).optional(),
});

type TokenFormData = z.infer<typeof tokenSchema>;

const TokenCreationForm: React.FC = () => {
  const { account, connect } = useWeb3();
  const { createToken, isLoading, error: contractError } = useTokenFactory();
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
  });

  const onSubmit = async (data: TokenFormData) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      const address = await createToken(
        data.name,
        data.symbol,
        data.decimals,
        data.totalSupply
      );

      if (address) {
        setTokenAddress(address);
        // TODO: Save additional token info (description, website, social links) to backend
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token');
    }
  };

  return (
    <div className={styles.container}>
      {!account ? (
        <div className={styles.connectWallet}>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to create a token</p>
          <button onClick={connect} className={styles.connectButton}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2 className={styles.title}>Create New Token</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Token Name</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Feathered Token"
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="symbol">Token Symbol</label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              className={styles.input}
              placeholder="e.g., FEATHER"
            />
            {errors.symbol && <span className={styles.error}>{errors.symbol.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="decimals">Decimals</label>
            <input
              id="decimals"
              type="number"
              {...register('decimals', { valueAsNumber: true })}
              className={styles.input}
              placeholder="e.g., 18"
            />
            {errors.decimals && <span className={styles.error}>{errors.decimals.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="totalSupply">Total Supply</label>
            <input
              id="totalSupply"
              type="text"
              {...register('totalSupply')}
              className={styles.input}
              placeholder="e.g., 1000000"
            />
            {errors.totalSupply && <span className={styles.error}>{errors.totalSupply.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              {...register('description')}
              className={styles.textarea}
              placeholder="Describe your token..."
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="website">Website (Optional)</label>
            <input
              id="website"
              type="url"
              {...register('website')}
              className={styles.input}
              placeholder="https://your-token-website.com"
            />
            {errors.website && <span className={styles.error}>{errors.website.message}</span>}
          </div>

          <div className={styles.socialSection}>
            <h3>Social Links (Optional)</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="twitter">Twitter</label>
              <input
                id="twitter"
                type="url"
                {...register('socialLinks.twitter')}
                className={styles.input}
                placeholder="https://twitter.com/your-token"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telegram">Telegram</label>
              <input
                id="telegram"
                type="url"
                {...register('socialLinks.telegram')}
                className={styles.input}
                placeholder="https://t.me/your-token"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="discord">Discord</label>
              <input
                id="discord"
                type="url"
                {...register('socialLinks.discord')}
                className={styles.input}
                placeholder="https://discord.gg/your-token"
              />
            </div>
          </div>

          {(error || contractError) && (
            <div className={styles.errorMessage}>
              {error || contractError}
            </div>
          )}

          {tokenAddress && (
            <div className={styles.successMessage}>
              <h3>Token Created Successfully!</h3>
              <p>Token Address: {tokenAddress}</p>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Token...' : 'Create Token'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TokenCreationForm; 