import { StatsTable, useScreenWatcher } from "rond";

import { ATTACK_ELEMENTS } from "@/constants/global";
import { useTranslation } from "@/hooks";

// Component
import { CoreStatRows, CoreStatRowsMobile, type CoreStatRowsProps } from "./CoreStatRows";
import { EmSection } from "./EmSection";

const { Row, Cell } = StatsTable;

interface AttributeTableProps {
  className?: string;
  attributes: CoreStatRowsProps["attributes"];
}

export function AttributeTable({ className, attributes }: AttributeTableProps) {
  const { t } = useTranslation();
  const isMobile = !useScreenWatcher().isFromSize("md");

  if (!attributes) {
    return null;
  }

  return (
    <StatsTable className={className} aria-label="attribute-table">
      {isMobile ? (
        <CoreStatRowsMobile attributes={attributes} />
      ) : (
        <CoreStatRows attributes={attributes} />
      )}

      {attributes.get("em") ? <EmSection value={attributes.get("em")} /> : null}

      {(["cRate_", "cDmg_", "er_", "healB_", "inHealB_", "shieldS_"] as const).map((type) => {
        const val = attributes.get(type);
        if (Math.round(val * 10) / 10 === 0) return null;
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {ATTACK_ELEMENTS.map((type) => {
        const val = attributes.get(type);
        if (Math.round(val * 10) / 10 === 0) return null;
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {(["naAtkSpd_", "caAtkSpd_"] as const).map((type) => {
        const val = attributes.get(type);
        if (Math.round(val * 10) / 10 === 0) return null;
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}
    </StatsTable>
  );
}
