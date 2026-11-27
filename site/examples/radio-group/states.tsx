import { Radio, RadioGroup } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 24 }}>
			<RadioGroup name="ship" label="배송 방법" supportingText="하나를 골라 주세요" invalid>
				<Radio value="parcel" label="택배" />
				<Radio value="pickup" label="매장 수령" />
			</RadioGroup>
			<RadioGroup name="pay" label="결제 수단" defaultValue="card" disabled>
				<Radio value="card" label="카드" />
				<Radio value="transfer" label="계좌 이체" />
			</RadioGroup>
		</div>
	);
}
