# Emoji Scrapping
This is a simple Javascript scrapper to get a json file with emoji categorized lists.

## How the type look's like
```ts
    {
        __version__: string,
        [key: string]: {
            [key: string]: [
                {
                    unicode: string | string[],
                    multicode: boolean,
                    name: string,
                    emoji: string
                },
                ...
            ]
        },
        ...
    }

```
