//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.12;
 
interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}
 
interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts); 
     function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}
  
contract FlashSwap {
  
    struct Swap1 {
        address[] path;
        uint amountOut;
    }

    struct Swap2 {
        address router1;
        address router2;
        address token1;
        address token2;
        uint amountOut1;
        uint amountOut2;
    }

    struct Swap3 {
        address router1;
        address router2;
        address router3;
        address token1;
        address token2;
        address token3;
        uint amountOut1;
        uint amountOut2;
        uint amountOut3;
    }
 
    address private immutable _owner;  
  
    function owner() public view virtual returns (address) {
        return _owner;
    }
 
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    constructor() payable {
        _owner = msg.sender; 
    }

    receive() external payable {}
      
    function withdraw(uint amount) external onlyOwner payable {
        require(amount <= balance());
        payable(_owner).transfer(amount);
    }
 
    function withdrawOf(address token, uint amount) external onlyOwner payable {
        require(amount <= balanceOf(token));
        IERC20(token).transfer(payable(_owner), amount);
    }

    function balance() public view returns (uint) {
         return address(this).balance;
    }

    function balanceOf(address token) public view returns (uint) {
         return IERC20(token).balanceOf(address(this));
    }

    function destruct() public onlyOwner {
        address payable __owner = payable(owner());
        selfdestruct(__owner);
    }
 
    function getAmountOutMin(address router, address[] memory path, uint amount) public view returns (uint ) {
        uint result = 0;
        try IUniswapV2Router(router).getAmountsOut(amount, path) returns (uint[] memory amountOutMins) {
            result = amountOutMins[path.length -1];
        } catch { }
        return result;
    } 

    function getAmountOutMin2(address router, address tokenIn, address tokenOut, uint amount) public view returns (uint ) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        return getAmountOutMin(router, path, amount);
    }

    function swap(address router, address[]memory path, uint amountIn, uint amountOut) public onlyOwner returns (uint) {
        IERC20(path[0]).approve(router, amountIn);
        uint amountReceived = IUniswapV2Router(router).swapExactTokensForTokens(
            amountIn,
            amountOut,
            path,
            address(this), 
            block.timestamp + 30 minutes
        )[1];
        return amountReceived;
    }

    function swap2(address router, address tokenIn, address tokenOut, uint amountIn, uint amountOut) public onlyOwner returns (uint) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        return swap(router, path, amountIn, amountOut);
    }

    function searcher1(uint amountIn, address router, Swap1[] calldata data) external view returns (Swap1[] memory) {
        uint amountOut;
        Swap1[] memory _data = new Swap1[](data.length);
        for (uint i = 0; i < data.length; i++) {
            amountOut = getAmountOutMin(router, data[i].path, amountIn);
            _data[i] = data[i];
            _data[i].amountOut = amountOut;
        }
        return (_data);
    }
  
    function taker1(uint maxBlockNumber, address router, uint amountIn, Swap1 calldata data) external onlyOwner payable {
        require(block.number <= maxBlockNumber, 'out of block');
        uint amountReceived;
        amountReceived = swap(router, data.path, amountIn, data.amountOut);  
        require(amountReceived > amountIn, 'no profit');
    }
 
    function searcher2(uint amountIn, Swap2[] calldata data) external view returns (Swap2[] memory) {
        uint amountOut1;
        uint amountOut2;

        Swap2[] memory _data = new Swap2[](data.length);
        for (uint i = 0; i < data.length; i++) {
            amountOut1 = getAmountOutMin2(data[i].router1, data[i].token1, data[i].token2, amountIn);
            amountOut2 = getAmountOutMin2(data[i].router2, data[i].token2, data[i].token1, amountOut1);
            _data[i] = data[i];
            _data[i].amountOut1 = amountOut1;
            _data[i].amountOut2 = amountOut2;
        }
        return (_data);
    }
 
    function taker2(uint maxBlockNumber, uint amountIn, Swap2 calldata data) external onlyOwner payable {
        require(block.number <= maxBlockNumber, 'out of block');
        uint amountReceived;
        amountReceived = swap2(data.router1, data.token1, data.token2, amountIn, data.amountOut1);
        amountReceived = swap2(data.router2, data.token2, data.token1, data.amountOut1, data.amountOut2);
        require(amountReceived > amountIn, 'no profit');
    }

    function searcher3(uint amountIn, Swap3[] calldata data) external view returns (Swap3[] memory) {
        uint amountOut1;
        uint amountOut2;
        uint amountOut3;

        Swap3[] memory _data = new Swap3[](data.length);
        for (uint i = 0; i < data.length; i++) {
            amountOut1 = getAmountOutMin2(data[i].router1, data[i].token1, data[i].token2, amountIn);
            amountOut2 = getAmountOutMin2(data[i].router2, data[i].token2, data[i].token3, amountOut1);
            amountOut3 = getAmountOutMin2(data[i].router3, data[i].token3, data[i].token1, amountOut2);
            _data[i] = data[i];
            _data[i].amountOut1 = amountOut1;
            _data[i].amountOut2 = amountOut2;
            _data[i].amountOut3 = amountOut3;
        }
        return (_data);
    }
 
    function taker3(uint maxBlockNumber, uint amountIn, Swap3 calldata data) external onlyOwner payable {
        require(block.number <= maxBlockNumber, 'out of block');
        uint amountReceived;
        amountReceived = swap2(data.router1, data.token1, data.token2, amountIn, data.amountOut1);
        amountReceived = swap2(data.router2, data.token2, data.token3, data.amountOut1, data.amountOut2);
        amountReceived = swap2(data.router3, data.token3, data.token1, data.amountOut2, data.amountOut3);
        require(amountReceived > amountIn, 'no profit');
    }
}