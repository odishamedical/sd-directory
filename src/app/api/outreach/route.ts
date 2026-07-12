import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { phone, businessName } = await req.json();
    if (!phone || !businessName) return NextResponse.json({ error: 'Missing phone or businessName' }, { status: 400 });

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // Get WhatsApp credentials from Firebase
    const waSettingsDoc = await adminDb.collection('system_settings').doc('whatsapp').get();
    const waSettings = waSettingsDoc.data();
    
    if (!waSettings?.token || !waSettings?.phoneId) {
       return NextResponse.json({ error: 'WhatsApp API not configured' }, { status: 500 });
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: 'claim_your_dehapa_profile',
        language: { code: 'en_US' },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: businessName }]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: cleanPhone }]
          }
        ]
      }
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${waSettings.phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${waSettings.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API Error:', data);
      return NextResponse.json({ error: 'Failed to send WhatsApp message', details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Outreach error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
