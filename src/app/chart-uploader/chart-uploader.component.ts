import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';
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
  processedData: any[] = [];

  constructor(private http: HttpClient) {
    this.fetchChartData();
  }

  fetchChartData() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.processedData = this.normalizeData(data);
        this.createChart(this.processedData);
      },
      error: () => alert('Failed to load data from backend'),
    });
  }

  onChartTypeChange() {
    this.createChart(this.processedData);
  }

  submitData() {
    try {
      const parsed = JSON.parse(this.jsonInput); //convert it into a js obj
      const normalized = this.normalizeData(parsed);
      this.http.post(this.apiUrl, normalized).subscribe({
        //sends to backenf
        next: () => {
          alert('Data uploaded successfully!');
          this.fetchChartData();
        },
        error: () => alert(' Failed to upload data'),
      });
    } catch (err) {
      alert(' Invalid JSON format');
    }
  }

  normalizeData(data: any[]): any[] {
    return data.map((item, i) => {
      return {
        category:
          item.category || item.country || item.label || `Item ${i + 1}`,
        value: item.value,
        timestamp: item.timestamp || Date.now() + i * 60000,
      };
    });
  }

  createChart(data: any[]) {
    if (this.root) this.root.dispose();
    this.root = am5.Root.new('chartdiv');
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // Add export menu
    am5plugins_exporting.Exporting.new(this.root, {
      menu: am5plugins_exporting.ExportingMenu.new(this.root, {}),
    });

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

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, { orientation: 'horizontal' })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        min: 0,
      })
    );
    //column series for vertical bars
    const series = chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: 'Bar Series',
        xAxis,
        yAxis,
        valueYField: 'value',
        categoryXField: 'category',
      })
    );
    // Configure tooltip for the series
    series.set(
      'tooltip',
      am5.Tooltip.new(this.root, {
        labelText: 'Category: {categoryX}\nValue: {valueY}',
      })
    );

    // Configure column template for better interaction
    series.columns.template.setAll({
      tooltipText: 'Category: {categoryX}\nValue: {valueY}',
      cursorOverStyle: 'pointer',
    });

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(chart.series.values);

    xAxis.data.setAll(data); //tells the X-axis which category names to display.
    series.data.setAll(data); //tells the bars how tall to be.

    series.appear(1000);
    chart.appear(1000, 100);
  }

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

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, { orientation: 'horizontal' })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'minute', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 50,
        }),
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
        // connect: false,
      })
    );

    // Configure tooltip for the series with better formatting
    series.set(
      'tooltip',
      am5.Tooltip.new(this.root, {
        labelText: '{categoryX}: {valueY}',
        pointerOrientation: 'vertical',
      })
    );

    // Add bullets to make hover interaction easier
    const bullet = series.bullets.push(() => {
      const bulletCircle = am5.Circle.new(this.root, {
        radius: 5,
        fill: series.get('fill'),
        stroke: am5.color('#ffffff'),
        strokeWidth: 2,
      });
      return am5.Bullet.new(this.root, {
        sprite: bulletCircle,
      });
    });

    // Configure stroke for the line
    series.strokes.template.setAll({
      strokeWidth: 3,
    });

    // Add cursor for better interaction
    chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'zoomX',
      })
    );

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(chart.series.values);

    // Prepare data with category for better tooltip display
    const processedData = data.map((item) => ({
      ...item,
      categoryX: item.category, // Add categoryX for tooltip
    }));

    series.fills.template.setAll({
      fillOpacity: 0.5,
      visible: true,
    });

    xAxis.data.setAll(processedData);
    series.data.setAll(processedData);
    series.appear(1000);
    chart.appear(1000, 100);
  }

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

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(data);

    series.data.setAll(data);
    series.appear(1000, 100);
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
