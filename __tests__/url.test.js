import { isURLValid } from "../utils/testUrls.utils.js";


describe("Testing URL",()=>{
    describe("Invalid URLs",()=>{
        test("Empty String",()=>{
            expect(isURLValid("")).toBe(false);
        })

        test("Without http/https",()=>{
            expect(isURLValid("google.com")).toBe(false);
        })

        test("Numbers",()=>{
            expect(isURLValid(123)).toBe(false);
        })

        test("Null",()=>{
            expect(isURLValid(null)).toBe(false);
        })
        
        test("Invalid protocol",()=>{
            expect(isURLValid("rewr:80//google.com")).toBe(false);
        })

        test("Javascript as host protocol",()=>{
            expect(isURLValid("javascript://evil.com")).toBe(false);
        })

        test("FTP as host protocol",()=>{
            expect(isURLValid("ftp://files.com")).toBe(false);
        })

        test("undefined",()=>{
            expect(isURLValid(undefined)).toBe(false);       
        })
    })

    describe("Valid URLs",()=>{
        test("with https",()=>{
            expect(isURLValid("https://google.com")).toBe(true);
        })

        test("with http",()=>{
            expect(isURLValid("http://google.com")).toBe(true);
        })
    })
})