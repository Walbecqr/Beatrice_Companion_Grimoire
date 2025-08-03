import { NextResponse } from 'next/server'
import { ResponseCache } from '@/lib/utils/response-cache'
import { edgeConfig } from '@/lib/utils/edge-config'

export async function POST(request: Request) {
  try {
    const cacheSettings = await edgeConfig.getCacheSettings()
    
    if (!cacheSettings.cacheWarmupEnabled) {
      return NextResponse.json(
        { message: 'Cache warming is disabled' },
        { status: 200 }
      )
    }

    const responseCache = new ResponseCache()
    
    // Warm the cache with common spiritual queries
    await responseCache.warmCache()
    
    console.log('🔥 Cache warming completed')
    
    return NextResponse.json({
      message: 'Cache warming completed successfully',
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('❌ Cache warming failed:', error)
    
    return NextResponse.json(
      { error: error.message || 'Cache warming failed' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Cache warming endpoint active',
    timestamp: new Date().toISOString(),
  })
}