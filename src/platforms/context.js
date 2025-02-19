let currentPlatform = null;

export function setPlatform(platformName) {
    currentPlatform = platformName;
}

export function getPlatform() {
    if (!currentPlatform) throw new Error("Plataforma não definida.");
    return currentPlatform;
}
