import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-chart-uploader',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chart-uploader.component.html',
  styleUrls: ['./chart-uploader.component.css'],
})
export class ChartUploaderComponent implements OnDestroy {
  private root!: am5.Root;
  private apiUrl = 'http://localhost:3000/data';

  chartType = 'bar'; // default chart type
  jsonInput: string = '';

  constructor(private http: HttpClient) {
    this.fetchChartData();
  }

  // Fetch data from backend
  fetchChartData() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.createChart(data),
      error: () => alert('❌ Failed to load data from backend'),
    });
  }

  // Handle dropdown change
  onChartTypeChange() {
    this.fetchChartData();
  }

  // POST new data to backend
  submitData() {
    try {
      const parsed = JSON.parse(this.jsonInput);
      this.http.post(this.apiUrl, parsed).subscribe({
        next: () => {
          alert('✅ Data uploaded successfully!');
          this.fetchChartData();
        },
        error: () => alert('❌ Failed to upload data'),
      });
    } catch (err) {
      alert('❌ Invalid JSON format');
    }
  }

  // Create the chart depending on type
  createChart(data: any[]) {
    if (this.root) this.root.dispose();
    this.root = am5.Root.new('chartdiv');
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    switch (this.chartType) {
      case 'bar':
        this.drawBarChart(data);
        break;
      case 'line':
        this.drawLineChart(data);
        break;
      case 'pie':
        this.drawPieChart(data);
        break;
      default:
        console.warn('Unsupported chart type');
    }
  }

  // BAR CHART
  drawBarChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: 'country',
        renderer: am5xy.AxisRendererX.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: 'Bar Series',
        xAxis,
        yAxis,
        valueYField: 'value',
        categoryXField: 'country',
        tooltip: am5.Tooltip.new(this.root, {
          labelText: '{valueY}',
        }),
      })
    );

    xAxis.data.setAll(data);
    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);
  }

  // LINE CHART
  drawLineChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'minute', count: 30 },
        renderer: am5xy.AxisRendererX.new(this.root, {}),
        tooltip: am5.Tooltip.new(this.root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Line Series',
        xAxis,
        yAxis,
        valueYField: 'value',
        valueXField: 'timestamp',
        tooltip: am5.Tooltip.new(this.root, {
          labelText: '{valueY}',
        }),
      })
    );

    xAxis.data.setAll(data);
    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);
  }

  // PIE CHART
  drawPieChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5percent.PieChart.new(this.root, {
        endAngle: 270,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(this.root, {
        valueField: 'value',
        categoryField: 'category',
        endAngle: 270,
      })
    );

    series.states.create('hidden', {
      endAngle: -90,
    });

    series.data.setAll(data);
    series.appear(1000, 100);
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
