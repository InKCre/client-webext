// index of block module

import { inkcreApi } from "./storage";

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

  static async fromEmbedding(params: {
    blockId?: number;
    query?: string;
    resolver?: string;
    maxDistance?: number;
    num?: number;
  }): Promise<Block[]> {
    const url = new URL("/blocks/query/by_embedding", inkcreApi.value);
    if (params.query !== undefined) {
      url.searchParams.set("query", params.query);
    }
    if (params.blockId !== undefined) {
      url.searchParams.set("block_id", params.blockId.toString());
    }
    if (params.resolver !== undefined) {
      url.searchParams.set("resolver", params.resolver);
    }
    if (params.maxDistance !== undefined) {
      url.searchParams.set("max_distance", params.maxDistance.toString());
    }
    if (params.num !== undefined) {
      url.searchParams.set("num", params.num.toString());
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `Failed to fetch blocks by embedding: ${response.statusText}`
      );
    }
    const data: any[] = await response.json();
    return data.map(
      (item) =>
        new Block(
          item.resolver,
          item.content,
          item.storage,
          item.id,
          item.updated_at
        )
    );
  }
}

export class BlockForm {
  constructor(
    public resolver: string,
    public content: string,
    public storage: string | null = null
  ) {}
}
