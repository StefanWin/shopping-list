export function setShareToken(token: string): void {
	const SHARE_TOKEN_KEY = 'shopping-list-share-token';
	localStorage.setItem(SHARE_TOKEN_KEY, token);
}

export function getShareToken(): string | null {
	const SHARE_TOKEN_KEY = 'shopping-list-share-token';
	return localStorage.getItem(SHARE_TOKEN_KEY);
}

export function clearShareToken(): void {
	const SHARE_TOKEN_KEY = 'shopping-list-share-token';
	localStorage.removeItem(SHARE_TOKEN_KEY);
}

export function getActiveToken(deviceId: string): string {
	// If a share token is set, use it. Otherwise, use the device ID.
	const shareToken = getShareToken();
	return shareToken || deviceId;
}
