/**
 * Приводит значение к конечному числу (finite number) либо к значению по умолчанию.
 *
 * Поведение по входным типам:
 * - `number` — возвращается как есть, если оно конечно (`Number.isFinite`).
 *   `NaN`, `Infinity` и `-Infinity` заменяются на `fallback`.
 * - `string` — парсится через `Number()`. Это значит, что:
 *     * `'42'` / `'3.14'` / `'1e3'` → соответствующие числа;
 *     * пустая строка `''` и строка из пробелов `'   '` → `0`
 *       (стандартное поведение `Number('')`), а не `fallback`;
 *     * нечисловые строки (`'abc'`, `'12px'`) → `fallback`;
 *     * `'Infinity'` → `fallback` (не проходит `Number.isFinite`).
 * - `null` / `undefined` — сразу возвращается `fallback` без попытки парсинга.
 * - любой другой тип (объект, boolean, symbol, bigint и т.п.) — `fallback`.
 *
 * Функция никогда не бросает исключений и всегда возвращает число.
 *
 * @param value    Исходное значение: число, Decimal-строка, `null`, `undefined`
 *                 или произвольное значение из внешнего источника.
 * @param fallback Значение по умолчанию, возвращаемое при невозможности
 *                 получить конечное число. Ожидается конечное число; если
 *                 передать `NaN`/`Infinity`, они будут возвращены как есть.
 *                 По умолчанию `0`.
 * @returns Конечное число — либо распарсенное `value`, либо `fallback`.
 *
 * @example
 * toNum('42');           // 42
 * toNum('3.14');         // 3.14
 * toNum(7);              // 7
 * toNum(null);           // 0
 * toNum(undefined, -1);  // -1
 * toNum('abc', 5);       // 5
 * toNum(Infinity, 0);    // 0
 * toNum('');             // 0  — как Number('')
 * toNum({}, 0);          // 0
 */
export default function toNum(value: unknown, fallback = 0): number {
	if (value == null) return fallback;

	let n: number;
	if (typeof value === 'number') {
		n = value;
	} else if (typeof value === 'string') {
		n = Number(value);
	} else {
		return fallback;
	}

	return Number.isFinite(n) ? n : fallback;
}