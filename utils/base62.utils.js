const base62Digits ="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const base62encoding=(number)=>{
    if(typeof number!=='number' || !Number.isInteger(number) || number<1){
        throw new Error(`Invalid input: expected a positive integer, got ${number}`);
    }
    let remainder=0;
    let base62="";
    while(number>0){
        remainder=number%62;
        base62=(base62Digits[remainder])+base62;
        number=Math.floor(number/62);
    }
    return base62;
}

const base62decoding=(text)=>{
    let number=0;
    for(let i=0;i<text.length;i++){
        let power=text.length-i-1;
        let position=base62Digits.indexOf(text.charAt(i));
        number=number+(Math.pow(62,power)*position);
    }
    return number;
}

// console.log(base62encoding(1));
// console.log(base62encoding(125));
// console.log(base62encoding(3521614606208));
// console.log(base62encoding(Infinity));

export {base62decoding,base62encoding};

