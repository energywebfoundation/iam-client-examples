import { Directive, EventEmitter, HostListener, Input, Output, } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]',
})
export class CopyToClipboardDirective {
  @Input() public copyClipboard: string;
  @Input() public message: string;

  @Output() public copied: EventEmitter<string> = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.copyClipboard) {
      return;
    }

    const listener = (e: ClipboardEvent) => {
      const clipboard = e.clipboardData || (window as any).clipboardData;
      clipboard.setData('text', this.copyClipboard.toString());
      e.preventDefault();

      this.copied.emit(this.copyClipboard);
    };

    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);
  }

}
