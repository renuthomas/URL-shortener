import { base62encoding } from "../utils/base62.utils.js";

describe("Testing Base62 Encoding",()=>{

    //Value check

    describe("happy path",()=>{

        test("encodes 1",()=>{
            expect(base62encoding(1)).toBe("1");
        })
        
        test("encodes 62",()=>{
            expect(base62encoding(62)).toBe("10");
        })
        
        test("encodes 125",()=>{
            expect(base62encoding(125)).toBe("21");
        })
    })
    
    //Error handling
    
    describe("invalid inputs",()=>{
        
        test("encoding 0 throws error",()=>{
            expect(()=>base62encoding(0)).toThrow();
        })
        
        test("encoding -1 throws error",()=>{
            expect(()=>base62encoding(-1)).toThrow();
        })
        
        test("encoding 1.5 throws error",()=>{
            expect(()=>base62encoding(1.5)).toThrow();
        })
        
        test("encoding 'hello' throws error",()=>{
            expect(()=>base62encoding("hello")).toThrow();
        })
        
        test("encoding null throws error",()=>{
            expect(()=>base62encoding(null)).toThrow();
        })
        
        test("encoding Infinity throws error",()=>{
            expect(()=>base62encoding(Infinity)).toThrow();
        })
    })
})