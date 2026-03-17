import { NextResponse } from 'next/server';
import { performIngestion } from '@/lib/ingest';

export async function GET() {
  try {
    const result = await performIngestion();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Ingestion failed:', error);
    return NextResponse.json({ success: false, error: 'Ingestion failed' }, { status: 500 });
  }
}
