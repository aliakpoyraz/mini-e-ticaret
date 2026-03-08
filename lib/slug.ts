export function slugify(text: string): string {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
        'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ü': 'u', 'Ü': 'u'
    };

    let result = text;

    // Replace Turkish characters
    for (const key in trMap) {
        result = result.replace(new RegExp(key, 'g'), trMap[key]);
    }

    return result
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars (except space and dash)
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single dash
        .replace(/^-+|-+$/g, '');   // Remove leading/trailing dashes
}
