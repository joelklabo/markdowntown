"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { NextStep, NextStepAction, NextStepSeverity } from "@/lib/atlas/simulators/types";
import { cn } from "@/lib/cn";

const severityTone: Record<NextStepSeverity, "danger" | "warning" | "info" | "success"> = {
  error: "danger",
  warning: "warning",
  info: "info",
  ready: "success",
};

const severityLabel: Record<NextStepSeverity, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
  ready: "Ready",
};

type NextStepsPanelProps = {
  steps: NextStep[];
  title?: string;
  subtitle?: string;
  maxVisible?: number;
  onAction?: (action: NextStepAction, step: NextStep) => void;
  className?: string;
};

const DEFAULT_MAX_VISIBLE = 3;

export function NextStepsPanel({
  steps,
  title = "Next steps",
  subtitle = "Start here to fix the biggest issue.",
  maxVisible = DEFAULT_MAX_VISIBLE,
  onAction,
  className,
}: NextStepsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const { visibleSteps, hiddenCount } = useMemo(() => {
    if (expanded || steps.length <= maxVisible) {
      return { visibleSteps: steps, hiddenCount: 0 };
    }
    return {
      visibleSteps: steps.slice(0, maxVisible),
      hiddenCount: steps.length - maxVisible,
    };
  }, [expanded, maxVisible, steps]);

  const handleAction = (action: NextStepAction, step: NextStep) => {
    onAction?.(action, step);
  };

  return (
    <div className={cn("rounded-mdt-lg border border-mdt-border bg-mdt-surface p-mdt-5", className)}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading level="h3">{title}</Heading>
          {subtitle ? (
            <Text size="bodySm" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </Stack>

        {visibleSteps.length === 0 ? (
          <Text tone="muted">No next steps available yet.</Text>
        ) : (
          <Stack gap={3}>
            {visibleSteps.map((step) => {
              const hasActions = Boolean(step.primaryAction || step.secondaryActions?.length);
              const primaryAction = step.primaryAction;
              return (
                <div
                  key={step.id}
                  className="flex flex-col gap-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle px-mdt-4 py-mdt-3"
                >
                  <div className="flex flex-col gap-mdt-3 sm:flex-row sm:items-start">
                    <Badge tone={severityTone[step.severity]}>{severityLabel[step.severity]}</Badge>
                    <Stack gap={1} className="flex-1">
                      <Text weight="semibold">{step.title}</Text>
                      <Text size="bodySm" tone="muted" leading="relaxed">
                        {step.body}
                      </Text>
                    </Stack>
                  </div>
                  {hasActions ? (
                    <div className="flex flex-col gap-mdt-2 sm:flex-row sm:flex-wrap">
                      {primaryAction ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAction(primaryAction, step)}
                        >
                          {primaryAction.label}
                        </Button>
                      ) : null}
                      {step.secondaryActions?.map((action) => (
                        <Button
                          key={`${step.id}-${action.id}`}
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAction(action, step)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {hiddenCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="self-start"
              >
                Show all ({hiddenCount} more)
              </Button>
            ) : null}
            {expanded && steps.length > maxVisible ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
                className="self-start"
              >
                Show fewer
              </Button>
            ) : null}
          </Stack>
        )}
      </Stack>
    </div>
  );
}
