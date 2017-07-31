export class LocalStorageHidden {
  storage_name: string;
  
  constructor() {
    this.storage_name = "999_skips";
  }

  get_all_hidden(): string[] {
    return JSON.parse(localStorage.getItem(this.storage_name)) || [];
  }

  save_all_hidden(ids: string[]): void {
    localStorage.setItem(this.storage_name, JSON.stringify(ids));
  }

  add_one_hidden(id: string): string {
    let hidden = this.get_all_hidden();
    hidden.push(id);
    this.save_all_hidden(hidden);
    return id;
  }

  remove_from_hidden(id: string): string[] {
    let hidden = this.get_all_hidden();
    const id_index: number = hidden.indexOf(id);
    if (id_index != -1) {
      hidden.splice(id_index, 1);
      this.save_all_hidden(hidden);
      return hidden;
    }
  }

  is_hidden(): Function {
    const hidden = this.get_all_hidden();
    return function(id: string) : boolean {
      return hidden.indexOf(id) != -1;
    }
  }
}