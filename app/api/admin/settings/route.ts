import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settingsService';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await SettingsService.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const updatedSettings = await SettingsService.updateSettings({
      deliveryChargeGujarat: body.deliveryChargeGujarat,
      deliveryChargeDefault: body.deliveryChargeDefault,
      polishPrice: body.polishPrice,
      isPolishEnabled: body.isPolishEnabled,
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_PUT]', error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
