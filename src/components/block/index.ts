// index of block module

export class Block {
  /**
   * 块数据模型
   *
   * @param resolver 内容解析器（即内容类型）
   * @param content
   * @param storage 存储器（如content是图片链接，使用image_url存储器即可获取实际内容）
   * @param id 未创建时为未定义
   * @param updated_at 未创建时为未定义
   */
  constructor(
    public resolver: string,
    public content: string,
    public storage: string | null = null,
    public id?: number,
    public updated_at?: Date
  ) {}
}

export class BlockForm {
  constructor(
    public resolver: string,
    public content: string,
    public storage: string | null = null
  ) {}
}
