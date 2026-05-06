import {jest,describe, expect} from "@jest/globals";

jest.unstable_mockModule("../utils/database.utils.js",()=>({
    pool:{
        connect:jest.fn(),
        end: jest.fn().mockResolvedValue() 
    }
}));

const {pool}=await import("../utils/database.utils.js");
const {shortenURL}=await import("../controllers/urls.controller.js")

let res;
let mockClient;
beforeEach(() => {
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    mockClient={
        query:jest.fn(),
        release:jest.fn()
    }
});

describe("Test Shorten URL",()=>{
    test("should return 200 for shorten url",async()=>{

        pool.connect.mockResolvedValue(mockClient);

        mockClient.query
                    .mockResolvedValueOnce({}) //BEGIN
                    .mockResolvedValueOnce({rows:[{id:1}]}) //INSERT
                    .mockResolvedValueOnce({}) //UPDATE
                    .mockResolvedValueOnce({}) //COMMIT
        mockClient.release.mockResolvedValue(1);

        const req={
            body:{
                originalUrl:"https://google.com"

            }
        }

        await shortenURL(req,res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            shortCode:expect.any(String),
            shortUrl:expect.stringContaining("http://localhost:3000/")
        })
        expect(mockClient.release).toHaveBeenCalledWith();

    })

    test("should return 400 for invalid URL",async()=>{

        const req={
            body:{
                originalUrl:"javascript:alert(1)"
            }
        }

        await shortenURL(req,res);

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            message:"It is an invalid URL. Please provide a valid URL which begins with http:// or https://"
        })
    })

    test("should return 409 for duplicate short code",async()=>{

        pool.connect.mockResolvedValue(mockClient);
        mockClient.query
                    .mockResolvedValueOnce({}) //BEGIN
                    .mockRejectedValueOnce({code:'23505'}) //INSERT
                    .mockResolvedValueOnce({}) //ROLLBACK


        const req={
            body:{
                originalUrl:"https://google.com"
            }
        }

        await shortenURL(req,res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({message:'Alias already exists'});
        expect(mockClient.release).toHaveBeenCalledWith();
    })

    test("should return 500 for a database error",async () => {
        pool.connect.mockResolvedValue(mockClient);

        mockClient.query
                    .mockRejectedValueOnce(); //INSERT
        
        
        const req={
            body:{
                originalUrl:"https://google.com"
            }
        }
        
        await shortenURL(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({message:'Internal server error'})
        expect(mockClient.release).toHaveBeenCalledWith();
    })

})
