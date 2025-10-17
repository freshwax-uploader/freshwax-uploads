import type { APIRoute } from 'astro';
import { initializeR2 } from '../../lib/r2-storage';

export const GET: APIRoute = async ({ locals }) => {
  const logs: string[] = [];
  
  try {
    logs.push('Test started');
    
    const binding = locals?.runtime?.env?.MY_BUCKET;
    const env = locals?.runtime?.env;
    
    logs.push(`Binding exists: ${!!binding}`);
    logs.push(`Env exists: ${!!env}`);
    
    if (env) {
      logs.push(`R2_ACCOUNT_ID: ${env.R2_ACCOUNT_ID ? 'exists' : 'missing'}`);
      logs.push(`R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? 'exists' : 'missing'}`);
      logs.push(`R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? 'exists' : 'missing'}`);
    }
    
    logs.push('Attempting to initialize R2...');
    initializeR2(binding, env);
    logs.push('R2 initialized successfully!');
    
    return new Response(JSON.stringify({ 
      success: true,
      logs 
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    logs.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logs.push(`Stack: ${error instanceof Error ? error.stack : 'No stack'}`);
    
    return new Response(JSON.stringify({ 
      success: false,
      logs,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};