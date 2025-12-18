import { z } from 'zod';

const UAMMetadataSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  icon: z.string().optional(),
  homepage: z.string().url().optional(),
  license: z.string().optional(),
});

const UAMScopeSchema = z.string();

const UAMCapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});

const UAMBlockTypeSchema = z.enum(['instruction', 'prompt', 'code', 'context', 'unknown']);

const UAMBlockSchema = z.object({
  id: z.string().min(1),
  type: UAMBlockTypeSchema,
  content: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  scopes: z.array(UAMScopeSchema).optional(),
});

const UAMTargetSchema = z.object({
  platform: z.string().min(1),
  minVersion: z.string().optional(),
});

export const UniversalAgentDefinitionSchema = z.object({
  kind: z.literal('UniversalAgent'),
  apiVersion: z.literal('v1'),
  metadata: UAMMetadataSchema,
  scopes: z.array(UAMScopeSchema).optional(),
  capabilities: z.array(UAMCapabilitySchema).optional(),
  blocks: z.array(UAMBlockSchema),
  targets: z.array(UAMTargetSchema).optional(),
});
