export class IdTranslator {
    private _ids = new Map<number, number>();

    getTranslatedId(oldId: number): number {
        return this._ids.has(oldId) ? this._ids.get(oldId) : 0;
    }

    add(oldId: number, translatedId: number) {
        this._ids.set(oldId, translatedId);
    }

    clear() {
        this._ids.clear();
    }
}