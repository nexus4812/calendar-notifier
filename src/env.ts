const env = (key: string): string => {
    const prop = PropertiesService.getScriptProperties().getProperty(key);

    if (prop === null) {
        throw new Error(`The script property "${key}" is not set. Please set from the screen on the Web`);
    }

    return prop;
};

export default env;