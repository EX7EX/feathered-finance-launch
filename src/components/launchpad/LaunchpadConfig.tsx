import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './LaunchpadConfig.module.css';

const launchpadSchema = z.object({
  tokenAddress: z.string().min(42, 'Invalid token address'),
  saleType: z.enum(['fixed', 'dutch']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  price: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  minContribution: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  maxContribution: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  softCap: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  hardCap: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  vestingSchedule: z.object({
    tgePercentage: z.number().min(0).max(100),
    cliffMonths: z.number().min(0),
    vestingMonths: z.number().min(1),
  }),
  whitelistEnabled: z.boolean(),
  kycRequired: z.boolean(),
});

type LaunchpadFormData = z.infer<typeof launchpadSchema>;

const LaunchpadConfig: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LaunchpadFormData>({
    resolver: zodResolver(launchpadSchema),
    defaultValues: {
      saleType: 'fixed',
      whitelistEnabled: false,
      kycRequired: false,
      vestingSchedule: {
        tgePercentage: 0,
        cliffMonths: 0,
        vestingMonths: 12,
      },
    },
  });

  const saleType = watch('saleType');
  const whitelistEnabled = watch('whitelistEnabled');
  const kycRequired = watch('kycRequired');

  const onSubmit = async (data: LaunchpadFormData) => {
    try {
      // TODO: Implement launchpad configuration logic
      console.log('Launchpad configuration:', data);
    } catch (error) {
      console.error('Error configuring launchpad:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2 className={styles.title}>Configure Launchpad</h2>

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

        <div className={styles.formGroup}>
          <label>Sale Type</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                {...register('saleType')}
                value="fixed"
                className={styles.radio}
              />
              Fixed Price
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                {...register('saleType')}
                value="dutch"
                className={styles.radio}
              />
              Dutch Auction
            </label>
          </div>
        </div>

        <div className={styles.timeSection}>
          <div className={styles.formGroup}>
            <label htmlFor="startTime">Start Time</label>
            <input
              id="startTime"
              type="datetime-local"
              {...register('startTime')}
              className={styles.input}
            />
            {errors.startTime && <span className={styles.error}>{errors.startTime.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endTime">End Time</label>
            <input
              id="endTime"
              type="datetime-local"
              {...register('endTime')}
              className={styles.input}
            />
            {errors.endTime && <span className={styles.error}>{errors.endTime.message}</span>}
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (ETH)</label>
            <input
              id="price"
              type="text"
              {...register('price')}
              className={styles.input}
              placeholder="0.0"
            />
            {errors.price && <span className={styles.error}>{errors.price.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="minContribution">Min Contribution (ETH)</label>
            <input
              id="minContribution"
              type="text"
              {...register('minContribution')}
              className={styles.input}
              placeholder="0.0"
            />
            {errors.minContribution && <span className={styles.error}>{errors.minContribution.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxContribution">Max Contribution (ETH)</label>
            <input
              id="maxContribution"
              type="text"
              {...register('maxContribution')}
              className={styles.input}
              placeholder="0.0"
            />
            {errors.maxContribution && <span className={styles.error}>{errors.maxContribution.message}</span>}
          </div>
        </div>

        <div className={styles.capSection}>
          <div className={styles.formGroup}>
            <label htmlFor="softCap">Soft Cap (ETH)</label>
            <input
              id="softCap"
              type="text"
              {...register('softCap')}
              className={styles.input}
              placeholder="0.0"
            />
            {errors.softCap && <span className={styles.error}>{errors.softCap.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="hardCap">Hard Cap (ETH)</label>
            <input
              id="hardCap"
              type="text"
              {...register('hardCap')}
              className={styles.input}
              placeholder="0.0"
            />
            {errors.hardCap && <span className={styles.error}>{errors.hardCap.message}</span>}
          </div>
        </div>

        <div className={styles.vestingSection}>
          <h3>Vesting Schedule</h3>
          
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

        <div className={styles.optionsSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              {...register('whitelistEnabled')}
              className={styles.checkbox}
            />
            Enable Whitelist
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              {...register('kycRequired')}
              className={styles.checkbox}
            />
            Require KYC
          </label>
        </div>

        <button type="submit" className={styles.submitButton}>
          Configure Launchpad
        </button>
      </form>
    </div>
  );
};

export default LaunchpadConfig; 