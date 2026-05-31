declare module 'wikipedia' {
    interface Summary {
        extract: string;
    }

    interface SearchResult {
        results: {
            title: string;
        }[];
    }

    interface WikiPage {
        summary(): Promise<Summary>;
    }

    const wikipedia: {
        page(title: string): Promise<WikiPage>;
        search(query: string): Promise<SearchResult>;
    };

    export default wikipedia;
}