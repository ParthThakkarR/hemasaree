import { NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settingsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({
      deliveryChargeGujarat: settings.deliveryChargeGujarat,
      deliveryChargeDefault: settings.deliveryChargeDefault,
      polishPrice: settings.polishPrice,
      isPolishEnabled: settings.isPolishEnabled,
    });
  } catch (error) {
    console.error('[SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
