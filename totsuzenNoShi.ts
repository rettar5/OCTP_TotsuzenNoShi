import { OdnTweetData, OdnTweets } from "../../../odnTweets"
import { OdnPlugins, OdnPluginResultData } from "../../../odnPlugins";
import { Log } from "../../../odnUtils";

export class TotsuzenNoShi {
  constructor(private tweetData: OdnTweetData, private fullName: string) {}

  /**
   * プラグインのメイン処理を実行
   *
   * @param {(isProcessed?: boolean) => void} finish
   */
  run(finish: (isProcessed?: boolean) => void) {
    Log.d(this.tweetData.text);

    const tweets = new OdnTweets(this.tweetData.accountData);
    tweets.text = this.generateTotsuzenNoShi(this.tweetData.text);
    tweets.targetTweetId = this.tweetData.idStr;

    // ツイートを投稿
    tweets.postTweet((isSuccess) => {
      // 元ツイートをお気に入り登録
      tweets.likeTweet();
      finish();
    });
  }

  /**
   * プラグインを実行するかどうか判定
   *
   * @param {OdnTweetData} tweetData
   * @returns {boolean}
   */
  static isValid(tweetData: OdnTweetData): boolean {
    return false === tweetData.isRetweet && tweetData.text.match(/^(&gt;|＞)(.|\n)*(&lt;|＜)$/g) ? true : false;
  }

  /**
   * ＿人人人人人人人人人人人人人人＿
   * ＞　枠で囲ったテキストを取得　＜
   * ￣Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y￣
   *
   * @param source
   * @returns {string}
   */
  private generateTotsuzenNoShi(originalText: string): string {
    let text = (originalText || "").replace(/^(&gt;|＞)\s*/igm, "").replace(/\s*(&lt;|＜)$/igm, "");
    const maxLen = this.getMaxLength(text);
    // 空白パディング + ＞＜の追加
    text = (() => {
      let paddedText = "";
      for (const val of text.split("\n")) {
        const valLen = this.getMaxLength(val);
        paddedText += "\n＞　" + " ".repeat((maxLen - valLen) / 2) + val + " ".repeat((maxLen - valLen) / 2) + "　＜";
      }
      return paddedText;
    })();
    const len = Math.floor(maxLen / 2);
    return "＿" + ("人".repeat(len + 2)) + "＿"
           + text + "\n"
           + "￣Y" + ("^Y".repeat(len)) + "￣";
  }

  /**
   * 最も文字数が多い行の文字数を取得
   *
   * @param text
   * @returns {number}
   */
  private getMaxLength(text: string): number {
    let max = 0;
    for (const str of text.split("\n")) {
      const length = this.getLengthBytes(str);
      if (max < length) {
        max = length;
      }
    }
    return max;
  }

  /**
   * 文字数を取得
   * Thanks! (http://starwing.net/suddenly_death.html)
   *
   * @param text
   * @returns {number}
   */
  private getLengthBytes(text: string): number {
    text = text || "";
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
      // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
      if ( (char >= 0x0 && char < 0x81) || (char == 0xf8f0) || (char >= 0xff61 && char < 0xffa0) || (char >= 0xf8f1 && char < 0xf8f4)) {
        count += 1;
      } else {
        count += 2;
      }
    }
    return count;
  }
}