import Tokens from "./tokensTypes";
import Digits from "../values/digits";
import Ops from "../values/ops";

export default interface Token {
    type: Tokens,
    value?: number | string | Ops
}