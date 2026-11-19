import { Prose } from "@bigtablet/design-system";

// 서버에서 받은 글처럼 클래스가 없는 마크업에 타이포 규칙을 입힙니다
export default function Example() {
	return (
		<Prose>
			<h2>배송 정책</h2>
			<p>
				주문은 평일 오후 2시까지 결제하면 <strong>당일 출고</strong>됩니다. 주말 주문은 다음
				영업일에 나갑니다.
			</p>
			<ul>
				<li>제주 · 도서 지역은 1~2일 더 걸립니다</li>
				<li>
					자세한 내용은 <a href="/help/shipping">배송 안내</a>를 봅니다
				</li>
			</ul>
		</Prose>
	);
}
