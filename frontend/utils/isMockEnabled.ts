/***
 * Если мок-режим для запросов включен, то true
 */
export default function isMockEnabled() {
	return process.env.NEXT_PUBLIC_MOCK == "true";
}