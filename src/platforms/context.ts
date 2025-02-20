let currentPlatform: string | null = null;

export function setPlatform(platformName: string): void {
    currentPlatform = platformName;
}

export function getPlatform(): string {
    if (!currentPlatform) throw new Error("Plataforma não definida.");

    return currentPlatform;
}
