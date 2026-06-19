$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public class IconGenerator {
    public static void Draw(int size, string path) {
        Bitmap bmp = new Bitmap(size, size);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            float s = size / 512f;

            // Background
            using (Brush bgBrush = new SolidBrush(ColorTranslator.FromHtml("#FFC2D6"))) {
                GraphicsPath bgPath = new GraphicsPath();
                float r = 100 * s;
                bgPath.AddArc(0, 0, r*2, r*2, 180, 90);
                bgPath.AddArc(size - r*2, 0, r*2, r*2, 270, 90);
                bgPath.AddArc(size - r*2, size - r*2, r*2, r*2, 0, 90);
                bgPath.AddArc(0, size - r*2, r*2, r*2, 90, 90);
                bgPath.CloseFigure();
                g.FillPath(bgBrush, bgPath);
            }

            // Foreground pink
            using (Brush fgBrush = new SolidBrush(ColorTranslator.FromHtml("#FF6B9D"))) {
                // Bar
                g.FillPath(fgBrush, GetRoundedRect(100*s, 240*s, 312*s, 32*s, 10*s));
                // Left
                g.FillPath(fgBrush, GetRoundedRect(120*s, 160*s, 40*s, 192*s, 10*s));
                g.FillPath(fgBrush, GetRoundedRect(80*s, 180*s, 30*s, 152*s, 10*s));
                // Right
                g.FillPath(fgBrush, GetRoundedRect(352*s, 160*s, 40*s, 192*s, 10*s));
                g.FillPath(fgBrush, GetRoundedRect(402*s, 180*s, 30*s, 152*s, 10*s));
            }

            // Heart
            using (Brush whiteBrush = new SolidBrush(Color.White)) {
                GraphicsPath heartPath = new GraphicsPath();
                float hx = 256*s;
                float hy = 310*s;
                // Simple heart path using beziers matching the SVG roughly
                heartPath.AddBezier(hx, hy, hx - 40*s, hy - 40*s, hx - 40*s, hy - 80*s, hx, hy - 80*s);
                heartPath.AddBezier(hx, hy - 80*s, hx + 40*s, hy - 80*s, hx + 40*s, hy - 40*s, hx, hy);
                g.FillPath(whiteBrush, heartPath);
            }
        }
        bmp.Save(path, ImageFormat.Png);
    }

    private static GraphicsPath GetRoundedRect(float x, float y, float width, float height, float radius) {
        GraphicsPath path = new GraphicsPath();
        path.AddArc(x, y, radius * 2, radius * 2, 180, 90);
        path.AddArc(x + width - radius * 2, y, radius * 2, radius * 2, 270, 90);
        path.AddArc(x + width - radius * 2, y + height - radius * 2, radius * 2, radius * 2, 0, 90);
        path.AddArc(x, y + height - radius * 2, radius * 2, radius * 2, 90, 90);
        path.CloseFigure();
        return path;
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
New-Item -ItemType Directory -Force -Path "icons" | Out-Null
[IconGenerator]::Draw(192, "icons\icon-192.png")
[IconGenerator]::Draw(512, "icons\icon-512.png")
