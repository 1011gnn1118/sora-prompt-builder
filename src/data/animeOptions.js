export const animeOptions = {
  hairColor: [
    { en: "blonde", jp: "金髪" },
    { en: "black", jp: "黒髪" },
    { en: "pink", jp: "ピンク" },
    { en: "blue", jp: "青" },
  ],
  hairStyle: [
    { en: "long straight", jp: "ロングストレート" },
    { en: "twin tails", jp: "ツインテール" },
    { en: "short bob", jp: "ショートボブ" },
  ],
  eyeColor: [
    { en: "blue", jp: "青" },
    { en: "green", jp: "緑" },
    { en: "red", jp: "赤" },
    { en: "gold", jp: "金" },
  ],
  expression: [
    { en: "smiling", jp: "笑顔" },
    { en: "serious", jp: "真剣" },
    { en: "shy", jp: "恥ずかしそう" },
  ],
  outfit: [
    { en: "school uniform", jp: "セーラー服" },
    { en: "casual clothes", jp: "カジュアル服" },
    { en: "battle outfit", jp: "バトル衣装" },
  ],
  background: [
    { en: "cherry blossom park", jp: "桜の公園" },
    { en: "school classroom", jp: "学校の教室" },
    { en: "fantasy castle", jp: "ファンタジー城" },
  ],
  style: [
    { en: "anime style", jp: "アニメ風" },
    { en: "manga style", jp: "マンガ風" },
    { en: "cel shading", jp: "セル画調" },
  ],
};

export const toSelectOptions = (arr) => arr.map((i) => ({ value: i.en, label: i.en }));

export function findJP(en) {
  for (const group of Object.values(animeOptions)) {
    const hit = group.find((i) => i.en === en);
    if (hit) return hit.jp || en;
  }
  return en;
}
