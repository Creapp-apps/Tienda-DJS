import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  // Gracefully skip filesystem write if not running in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      success: true, 
      message: 'Static site overrides updated in-memory. File writes are disabled in production.' 
    });
  }

  try {
    const data = await request.json();
    
    // We target src/data/siteData.json relative to the project root
    const targetPath = path.join(process.cwd(), 'src', 'data', 'siteData.json');
    
    // Write cleanly with 2 spaces indentation
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Overrides successfully synced to src/data/siteData.json!' 
    });
  } catch (err) {
    console.error('Error syncing overrides to disk:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
