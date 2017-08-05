export interface SkipIDs {
  [key: string]: boolean
}

export class LocalStorageHidden {
  storage_name: string;
  all_hidden: SkipIDs;
  
  constructor() {
    this.storage_name = "999_skips_obj";
    this.all_hidden = this.get_all_hidden();
  }

  get_all_hidden(): SkipIDs {
    return JSON.parse(localStorage.getItem(this.storage_name)) || {};
  }

  save_all_hidden(ids: SkipIDs): void {
    this.all_hidden = ids;
    localStorage.setItem(this.storage_name, JSON.stringify(ids));
  }

  add_one_hidden(id: string): string {
    let hidden = this.get_all_hidden();
    hidden[id] = true;
    this.save_all_hidden(hidden);
    return id;
  }

  remove_from_hidden(id: string): SkipIDs {
    let hidden = this.all_hidden;
    delete(hidden[id]);
    this.save_all_hidden(hidden);
    return hidden;
  }

  remove_all_hidden(): void {
    localStorage.setItem(this.storage_name, '{}');
  }

  is_hidden(id: string): boolean {
    return this.all_hidden[id] != undefined;
  }
}
