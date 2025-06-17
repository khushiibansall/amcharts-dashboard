// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'amcharts-dashboard';
// }

import { Component } from '@angular/core';
import { ChartUploaderComponent } from './chart-uploader/chart-uploader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChartUploaderComponent],
  template: `<app-chart-uploader></app-chart-uploader>`,
})
export class AppComponent {
   title = 'amcharts-dashboard';
}
