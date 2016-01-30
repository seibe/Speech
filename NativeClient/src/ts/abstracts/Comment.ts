module Speech {
    
    export const CommentType = {
        NORMAL: "normal",
        QUESTION: "question",
        STAMP_PLUS: "stamp_plus",
        STAMP_CLAP: "stamp_clap",
        STAMP_HATENA: "stamp_hatena",
        STAMP_WARAI: "stamp_warai"
    }
    
    export interface Comment {
        type: string,
        text: string,
        pageUrl: string,
        userId?: number,
        name?: string,
        point?: { x: number, y: number, width?: number, height?: number }
    }
    
}
