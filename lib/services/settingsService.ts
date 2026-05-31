import { prisma } from '../../app/lib/prisma';
import { cache } from '../cache';

export class SettingsService {
  private static CACHE_KEY = 'store_settings';
  private static CACHE_TTL = 300; // 5 minutes

  /**
   * Fetch store settings (cached). If not found in DB, creates default.
   */
  static async getSettings() {
    let settings = await cache.get<any>(this.CACHE_KEY);

    if (!settings) {
      settings = await prisma.storeSettings.findFirst();
      
      // Seed default singleton if not exists
      if (!settings) {
        settings = await prisma.storeSettings.create({
          data: {
            deliveryChargeGujarat: 80,
            deliveryChargeDefault: 150,
            polishPrice: 450,
            isPolishEnabled: true,
          }
        });
      }

      await cache.set(this.CACHE_KEY, settings, this.CACHE_TTL);
    }

    return settings;
  }

  /**
   * Update store settings globally and bust cache.
   */
  static async updateSettings(data: {
    deliveryChargeGujarat?: number;
    deliveryChargeDefault?: number;
    polishPrice?: number;
    isPolishEnabled?: boolean;
  }) {
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          deliveryChargeGujarat: data.deliveryChargeGujarat ?? 80,
          deliveryChargeDefault: data.deliveryChargeDefault ?? 150,
          polishPrice: data.polishPrice ?? 450,
          isPolishEnabled: data.isPolishEnabled ?? true,
        }
      });
    } else {
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data
      });
    }

    // Bust the cache
    await cache.delete(this.CACHE_KEY);
    return settings;
  }
}
