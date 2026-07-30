using System;
using System.IO;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace AL_Manalaysay_ICU_Desktop
{
    public partial class Form1 : Form
    {
        private WebView2 webView;

        public Form1()
        {
            InitializeComponent();
            SetupForm();
            InitWebView();
        }

        private void SetupForm()
        {
            this.Text = "AL Manalaysay ICU Drip Calculator";
            this.Width = 1280;
            this.Height = 850;
            this.MinimumSize = new System.Drawing.Size(400, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = System.Drawing.Color.FromArgb(249, 115, 22);

            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.ico");
            if (File.Exists(iconPath))
            {
                try
                {
                    this.Icon = new Icon(iconPath);
                }
                catch { }
            }
        }

        private async void InitWebView()
        {
            webView = new WebView2
            {
                Dock = DockStyle.Fill
            };
            this.Controls.Add(webView);

            try
            {
                string dataFolder = Path.Combine(Path.GetTempPath(), "AL_Manalaysay_ICU_App_" + Process.GetCurrentProcess().Id);
                CoreWebView2Environment env = null;
                try
                {
                    env = await CoreWebView2Environment.CreateAsync(null, dataFolder);
                }
                catch
                {
                    // Fallback to default environment
                }

                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.IsZoomControlEnabled = true;

                string wwwrootPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
                if (!Directory.Exists(wwwrootPath))
                {
                    wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                string indexPath = Path.Combine(wwwrootPath, "index.html");
                if (File.Exists(indexPath))
                {
                    webView.CoreWebView2.Navigate(new Uri(indexPath).AbsoluteUri);
                }
                else
                {
                    webView.CoreWebView2.NavigateToString("<h2>AL Manalaysay ICU Drip Calculator</h2><p>Assets missing.</p>");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("WebView2 Initialization Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
