import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StartupData } from './betalist';
import { AnalysisResult } from './analyzer';

/**
 * Helper function to clone and normalize colors in an element for html2canvas
 */
function cloneAndNormalizeColors(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;

    // Get all elements including the clone itself
    const allElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];

    allElements.forEach((el) => {
        const styles = window.getComputedStyle(el);

        // Convert lab() and other modern color functions to RGB
        const colorProperties = [
            'color',
            'backgroundColor',
            'borderColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'outlineColor'
        ];

        colorProperties.forEach((prop) => {
            const value = styles.getPropertyValue(prop);
            if (value && (value.includes('lab(') || value.includes('lch(') || value.includes('oklab(') || value.includes('oklab('))) {
                // Get the computed RGB value
                const tempDiv = document.createElement('div');
                tempDiv.style[prop as any] = value;
                document.body.appendChild(tempDiv);
                const computedValue = window.getComputedStyle(tempDiv).getPropertyValue(prop);
                document.body.removeChild(tempDiv);

                // Apply the RGB value
                if (computedValue && computedValue !== value) {
                    el.style[prop as any] = computedValue;
                }
            }
        });
    });

    return clone;
}

/**
 * Generate and download a PDF from an HTML element
 */
export async function generatePDFFromHTML(element: HTMLElement, filename: string): Promise<void> {
    try {
        if (!element) {
            throw new Error('No element provided for PDF generation');
        }

        console.log('Starting PDF generation for element:', element.tagName);

        // Clone and normalize colors to avoid lab() color function issues
        const normalizedElement = cloneAndNormalizeColors(element);

        // Temporarily add to DOM for rendering (hidden)
        normalizedElement.style.position = 'absolute';
        normalizedElement.style.left = '-9999px';
        normalizedElement.style.top = '0';
        document.body.appendChild(normalizedElement);

        let canvas;
        try {
            // Capture the HTML element as a canvas with improved settings
            canvas = await html2canvas(normalizedElement, {
                scale: 1.5,
                useCORS: true,
                logging: false, // Disable logging for cleaner output
                allowTaint: false,
                backgroundColor: '#ffffff',
            });
        } catch (err: any) {
            console.error('html2canvas error:', err);
            throw new Error(`Canvas rendering failed: ${err.message || 'Unknown error'}`);
        } finally {
            // Clean up the cloned element
            if (document.body.contains(normalizedElement)) {
                document.body.removeChild(normalizedElement);
            }
        }

        if (!canvas) {
            throw new Error('Canvas generation failed - no canvas returned');
        }

        console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

        const imgData = canvas.toDataURL('image/png');

        if (!imgData || imgData === 'data:,') {
            throw new Error('Failed to convert canvas to image data');
        }

        // Calculate PDF dimensions (A4 size)
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(imgHeight, pageHeight));
        heightLeft -= pageHeight;

        // Add additional pages if content is longer than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        console.log('PDF created, initiating download...');

        // Download PDF
        pdf.save(filename);

        console.log('PDF download successful');
    } catch (error) {
        console.error('PDF generation error details:', error);

        // Provide user-friendly error message
        if (error instanceof Error) {
            alert(`Failed to export PDF: ${error.message}\n\nTry using Markdown export instead.`);
        } else {
            alert('Failed to export PDF. Please try using Markdown export instead.');
        }

        // Don't re-throw - let the component handle it gracefully
    }
}

/**
 * Generate and download a CSV file from comprehensive analysis data
 */
export function generateCSVFromAnalysis(
    startup: StartupData,
    analysis: any, // Accept both legacy AnalysisResult and ProductAnalysisComplete
    filename: string = 'analysis-results.csv'
): void {
    try {
        // Check if this is the new ProductAnalysisComplete format
        const isComprehensive = 'scores' in analysis && 'problemAnalysis' in analysis;

        if (isComprehensive) {
            // New comprehensive CSV format
            const headers = [
                'Product Name',
                'Tagline',
                'Description',
                'Topics',
                'Website',
                'BetaList URL',
                'Feasibility Score',
                'Desirability Score',
                'Viability Score',
                'Overall Score',
                'Summary',
                'Core Problem',
                'Target Market',
                'Competition Level',
                'Engineering Complexity (1-5)',
                'Estimated Dev Time',
                'Pricing Model',
                'Recommendation',
                'Confidence',
                'Analyzed At'
            ];

            const escapeCsvValue = (value: string | number): string => {
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            const data = [
                escapeCsvValue(startup.name),
                escapeCsvValue(startup.tagline),
                escapeCsvValue(startup.description.substring(0, 200) + '...'),
                escapeCsvValue(startup.topics.join('; ')),
                escapeCsvValue(startup.website),
                escapeCsvValue(startup.betalistUrl),
                escapeCsvValue(analysis.scores.feasibility),
                escapeCsvValue(analysis.scores.desirability),
                escapeCsvValue(analysis.scores.viability),
                escapeCsvValue(analysis.scores.overall),
                escapeCsvValue(analysis.summary),
                escapeCsvValue(analysis.problemAnalysis.coreProblem),
                escapeCsvValue(analysis.targetMarket.primaryNiche),
                escapeCsvValue(analysis.competition.competitionLevel),
                escapeCsvValue(analysis.technicalFeasibility.engineeringComplexity),
                escapeCsvValue(analysis.technicalFeasibility.estimatedDevTime),
                escapeCsvValue(analysis.businessModel.pricingModel),
                escapeCsvValue(analysis.recommendation.verdict),
                escapeCsvValue(analysis.recommendation.confidence),
                escapeCsvValue(new Date().toISOString())
            ];

            const csvContent = [headers.join(','), data.join(',')].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Legacy format support
            const headers = [
                'Startup Name',
                'Tagline',
                'Description',
                'Topics',
                'Website',
                'BetaList URL',
                'Feasibility Score',
                'Feasibility Reasoning',
                'Desirability Score',
                'Desirability Reasoning',
                'Viability Score',
                'Viability Reasoning',
                'Overall Score',
                'Summary',
                'Analyzed At'
            ];

            const escapeCsvValue = (value: string | number): string => {
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            const data = [
                escapeCsvValue(startup.name),
                escapeCsvValue(startup.tagline),
                escapeCsvValue(startup.description.substring(0, 200) + '...'),
                escapeCsvValue(startup.topics.join('; ')),
                escapeCsvValue(startup.website),
                escapeCsvValue(startup.betalistUrl),
                escapeCsvValue(analysis.feasibility.score),
                escapeCsvValue(analysis.feasibility.reasoning),
                escapeCsvValue(analysis.desirability.score),
                escapeCsvValue(analysis.desirability.reasoning),
                escapeCsvValue(analysis.viability.score),
                escapeCsvValue(analysis.viability.reasoning),
                escapeCsvValue(analysis.overallScore),
                escapeCsvValue(analysis.summary),
                escapeCsvValue(new Date().toISOString())
            ];

            const csvContent = [headers.join(','), data.join(',')].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error generating CSV:', error);
        throw new Error('Failed to generate CSV');
    }
}
