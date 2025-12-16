import { NextResponse } from 'next/server';
import { compile } from '@/lib/uam/compile';
import { UniversalAgentDefinitionSchema } from '@/lib/uam/schema';
import { z } from 'zod';

const RequestSchema = z.object({
  definition: UniversalAgentDefinitionSchema,
  targets: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = RequestSchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: body.error.issues },
        { status: 400 }
      );
    }

    const result = await compile(body.data.definition, body.data.targets);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
