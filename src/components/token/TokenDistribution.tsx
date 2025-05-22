import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './TokenDistribution.module.css';

const distributionSchema = z.object({
  tokenAddress: z.string().min(42, 'Invalid token address'),
  recipients: z.array(z.object({
    address: z.string().min(42, 'Invalid address'),
    amount: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  })).min(1, 'At least one recipient is required'),
  vestingEnabled: z.boolean(),
  vestingSchedule: z.object({
    tgePercentage: z.number().min(0).max(100),
    cliffMonths: z.number().min(0),
    vestingMonths: z.number().min(1),
  }).optional(),
});

type DistributionFormData = z.infer<typeof distributionSchema>;

const TokenDistribution: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      recipients: [{ address: '', amount: '' }],
      vestingEnabled: false,
      vestingSchedule: {
        tgePercentage: 0,
        cliffMonths: 0,
        vestingMonths: 12,
      },
    },
  });

  const vestingEnabled = watch('vestingEnabled');

  const addRecipient = () => {
    const currentRecipients = watch('recipients');
    const newRecipients = [...currentRecipients, { address: '', amount: '' }];
    // TODO: Implement recipient addition logic
  };

  const removeRecipient = (index: number) => {
    const currentRecipients = watch('recipients');
    const newRecipients = currentRecipients.filter((_, i) => i !== index);
    // TODO: Implement recipient removal logic
  };

  const onSubmit = async (data: DistributionFormData) => {
    try {
      // TODO: Implement token distribution logic
      console.log('Token distribution data:', data);
    } catch (error) {
      console.error('Error distributing tokens:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2 className={styles.title}>Token Distribution</h2>

        <div className={styles.formGroup}>
          <label htmlFor="tokenAddress">Token Address</label>
          <input
            id="tokenAddress"
            type="text"
            {...register('tokenAddress')}
            className={styles.input}
            placeholder="0x..."
          />
          {errors.tokenAddress && <span className={styles.error}>{errors.tokenAddress.message}</span>}
        </div>

        <div className={styles.recipientsSection}>
          <div className={styles.sectionHeader}>
            <h3>Recipients</h3>
            <button
              type="button"
              onClick={addRecipient}
              className={styles.addButton}
            >
              Add Recipient
            </button>
          </div>

          {watch('recipients').map((_, index) => (
            <div key={index} className={styles.recipientRow}>
              <div className={styles.formGroup}>
                <label htmlFor={`recipient-${index}-address`}>Address</label>
                <input
                  id={`recipient-${index}-address`}
                  type="text"
                  {...register(`recipients.${index}.address`)}
                  className={styles.input}
                  placeholder="0x..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor={`recipient-${index}-amount`}>Amount</label>
                <input
                  id={`recipient-${index}-amount`}
                  type="text"
                  {...register(`recipients.${index}.amount`)}
                  className={styles.input}
                  placeholder="0.0"
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.vestingSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              {...register('vestingEnabled')}
              className={styles.checkbox}
            />
            Enable Vesting
          </label>

          {vestingEnabled && (
            <div className={styles.vestingOptions}>
              <div className={styles.formGroup}>
                <label htmlFor="tgePercentage">TGE Percentage</label>
                <input
                  id="tgePercentage"
                  type="number"
                  {...register('vestingSchedule.tgePercentage', { valueAsNumber: true })}
                  className={styles.input}
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cliffMonths">Cliff (Months)</label>
                <input
                  id="cliffMonths"
                  type="number"
                  {...register('vestingSchedule.cliffMonths', { valueAsNumber: true })}
                  className={styles.input}
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="vestingMonths">Vesting Period (Months)</label>
                <input
                  id="vestingMonths"
                  type="number"
                  {...register('vestingSchedule.vestingMonths', { valueAsNumber: true })}
                  className={styles.input}
                  placeholder="12"
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          Distribute Tokens
        </button>
      </form>
    </div>
  );
};

export default TokenDistribution; 