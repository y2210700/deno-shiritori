// server.js
//deno.landに公開されているモジュールをimport
//denoではURLを直に記載してimportできます
import {serveDir} from "https://deno.land/std@0.223.0/http/file_server.ts";

//直前の単語を保持する
let previousWord = "しりとり";
// 使った単語の履歴
let wordHistories = ["しりとり"];

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (request) => {
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);
    // ./public以下のファイルを公開

    // GET /shiritori: 直前の単語を返す
    if (request.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    // POST /shiritori: 次の単語を入力する
    if (request.method === "POST" && pathname === "/shiritori") {
        // リクエストのペイロードを取得
        const requestJson = await request.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];

        // previousWordの末尾とnextWordの戦闘が同一か確認
        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {

            if (nextWord.slice(-1) === "ん"){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "入力した単語が「ん」で終わりました",
                        "errorCode": "10002"
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json; charset=utf-8"}
                    }
                );
            }

            if (wordHistories.includes(nextWord)) {
                return new Response(
                    JSON.stringify({
                        "errorMessage": "同じ単語が入力されました",
                        "errorCode": "10003"
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json; charset=utf-8"}
                    }
                );
            }
            // 同一であれば、previousWordを更新
            previousWord = nextWord;
            wordHistories.push(nextWord);
        }
        // 同一でない単語の入力時に、エラーを返す
        else {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8"}
                }
            );
        }

        // 現在の単語を返す
        return new Response(previousWord);
    }

    // POST /reset: リセットする
    // request.methodとpathnameを確認
    if (request.method === "POST" && pathname === "/reset") {
        // 履歴の初期化
        wordHistories = ["しりとり"];
        // リセット後の初めの単語を渡す
        previousWord = "しりとり"
        return new Response(previousWord);
    }

    // ./public以下のファイルを公開
    return serveDir(
        request,
        {
            /*
            fsRoot: 公開するフォルダを指定
            urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に展開する
            enableCors: CORSの設定を付加するか
            */
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        }
    );
});