import mockData from '../mockData'

// Mock API for template management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const templateApi = {
  // Templates
  async getTemplates() {
    await delay(500)

    const templates = [
      {
        id: 'template-1',
        name: 'CBSE Report Card Template',
        description:
          'Standard CBSE report card template with grades and remarks',
        type: 'report_card',
        format: 'pdf',
        status: 'active',
        isDefault: true,
        version: '1.2',
        applicableClasses: [
          'class-1',
          'class-2',
          'class-3',
          'class-4',
          'class-5',
        ],
        layout: {
          orientation: 'portrait',
          pageSize: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        styling: {
          fontFamily: 'Arial',
          fontSize: 12,
          primaryColor: '#000000',
          secondaryColor: '#666666',
        },
        fields: [
          {
            id: 'field-1',
            name: 'student_name',
            label: 'Student Name',
            type: 'text',
            required: true,
            position: { x: 100, y: 50 },
            size: { width: 200, height: 20 },
          },
          {
            id: 'field-2',
            name: 'class',
            label: 'Class',
            type: 'text',
            required: true,
            position: { x: 100, y: 80 },
            size: { width: 100, height: 20 },
          },
          {
            id: 'field-3',
            name: 'marks_table',
            label: 'Marks Table',
            type: 'table',
            required: true,
            position: { x: 50, y: 150 },
            size: { width: 500, height: 300 },
          },
        ],
        content: `
<!DOCTYPE html>
<html>
<head>
    <title>Report Card</title>
    <style>
        body { font-family: {{font_family}}; font-size: {{font_size}}px; }
        .header { text-align: center; margin-bottom: 30px; }
        .student-info { margin-bottom: 20px; }
        .marks-table { width: 100%; border-collapse: collapse; }
        .marks-table th, .marks-table td { border: 1px solid #000; padding: 8px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SCHOOL REPORT CARD</h1>
        <h2>Academic Year: {{academic_year}}</h2>
    </div>
    
    <div class="student-info">
        <p><strong>Student Name:</strong> {{student_name}}</p>
        <p><strong>Class:</strong> {{class}} - {{section}}</p>
        <p><strong>Roll Number:</strong> {{roll_number}}</p>
        <p><strong>Father's Name:</strong> {{father_name}}</p>
    </div>
    
    <table class="marks-table">
        <thead>
            <tr>
                <th>Subject</th>
                <th>Max Marks</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            {{marks_table}}
        </tbody>
    </table>
    
    <div style="margin-top: 30px;">
        <p><strong>Overall Grade:</strong> {{overall_grade}}</p>
        <p><strong>Percentage:</strong> {{percentage}}%</p>
        <p><strong>Rank:</strong> {{rank}}</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p><strong>Class Teacher:</strong> ________________</p>
        <p><strong>Principal:</strong> ________________</p>
    </div>
</body>
</html>`,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T14:30:00Z',
        createdBy: 'Admin',
      },
      {
        id: 'template-2',
        name: 'Mark Sheet Template',
        description: 'Simple mark sheet template for internal assessments',
        type: 'mark_sheet',
        format: 'pdf',
        status: 'active',
        isDefault: false,
        version: '1.0',
        applicableClasses: [
          'class-6',
          'class-7',
          'class-8',
          'class-9',
          'class-10',
        ],
        layout: {
          orientation: 'landscape',
          pageSize: 'A4',
          margins: { top: 15, right: 15, bottom: 15, left: 15 },
        },
        styling: {
          fontFamily: 'Times New Roman',
          fontSize: 11,
          primaryColor: '#000000',
          secondaryColor: '#333333',
        },
        fields: [
          {
            id: 'field-4',
            name: 'exam_name',
            label: 'Examination Name',
            type: 'text',
            required: true,
            position: { x: 200, y: 30 },
            size: { width: 300, height: 25 },
          },
          {
            id: 'field-5',
            name: 'student_list',
            label: 'Student List',
            type: 'table',
            required: true,
            position: { x: 30, y: 100 },
            size: { width: 700, height: 400 },
          },
        ],
        content: `
<!DOCTYPE html>
<html>
<head>
    <title>Mark Sheet</title>
    <style>
        body { font-family: {{font_family}}; font-size: {{font_size}}px; }
        .header { text-align: center; margin-bottom: 20px; }
        .marks-table { width: 100%; border-collapse: collapse; font-size: 10px; }
        .marks-table th, .marks-table td { border: 1px solid #000; padding: 4px; text-align: center; }
        .marks-table th { background-color: #f0f0f0; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{school_name}}</h2>
        <h3>{{exam_name}} - Mark Sheet</h3>
        <p>Class: {{class}} - {{section}} | Date: {{exam_date}}</p>
    </div>
    
    <table class="marks-table">
        <thead>
            <tr>
                <th rowspan="2">S.No</th>
                <th rowspan="2">Roll No</th>
                <th rowspan="2">Student Name</th>
                {{subject_headers}}
                <th rowspan="2">Total</th>
                <th rowspan="2">Percentage</th>
                <th rowspan="2">Grade</th>
            </tr>
            <tr>
                {{max_marks_row}}
            </tr>
        </thead>
        <tbody>
            {{student_marks_rows}}
        </tbody>
    </table>
</body>
</html>`,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T09:00:00Z',
        createdBy: 'Teacher',
      },
      {
        id: 'template-3',
        name: 'Achievement Certificate',
        description: 'Certificate template for student achievements and awards',
        type: 'certificate',
        format: 'pdf',
        status: 'active',
        isDefault: false,
        version: '1.1',
        applicableClasses: [],
        layout: {
          orientation: 'landscape',
          pageSize: 'A4',
          margins: { top: 30, right: 30, bottom: 30, left: 30 },
        },
        styling: {
          fontFamily: 'Georgia',
          fontSize: 14,
          primaryColor: '#2c5aa0',
          secondaryColor: '#8b4513',
        },
        fields: [
          {
            id: 'field-6',
            name: 'student_name',
            label: 'Student Name',
            type: 'text',
            required: true,
            position: { x: 200, y: 200 },
            size: { width: 300, height: 30 },
          },
          {
            id: 'field-7',
            name: 'achievement',
            label: 'Achievement',
            type: 'text',
            required: true,
            position: { x: 150, y: 250 },
            size: { width: 400, height: 30 },
          },
        ],
        content: `
<!DOCTYPE html>
<html>
<head>
    <title>Certificate</title>
    <style>
        body { 
            font-family: {{font_family}}; 
            font-size: {{font_size}}px; 
            text-align: center;
            background: linear-gradient(45deg, #f0f8ff, #e6f3ff);
            padding: 40px;
        }
        .certificate-border {
            border: 8px solid {{primary_color}};
            padding: 40px;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .title { 
            font-size: 36px; 
            color: {{primary_color}}; 
            margin-bottom: 20px;
            font-weight: bold;
        }
        .subtitle { 
            font-size: 18px; 
            color: {{secondary_color}}; 
            margin-bottom: 40px;
        }
        .student-name { 
            font-size: 28px; 
            color: {{primary_color}}; 
            font-weight: bold;
            text-decoration: underline;
            margin: 20px 0;
        }
        .achievement { 
            font-size: 20px; 
            margin: 30px 0;
            line-height: 1.5;
        }
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <div class="certificate-border">
        <h1 class="title">CERTIFICATE OF ACHIEVEMENT</h1>
        <p class="subtitle">This is to certify that</p>
        
        <div class="student-name">{{student_name}}</div>
        
        <div class="achievement">
            has successfully achieved<br>
            <strong>{{achievement}}</strong><br>
            in the academic year {{academic_year}}
        </div>
        
        <p style="margin-top: 40px;">
            Awarded on {{award_date}}
        </p>
        
        <div class="signature-section">
            <div>
                <p>_________________</p>
                <p>Class Teacher</p>
            </div>
            <div>
                <p>_________________</p>
                <p>Principal</p>
            </div>
        </div>
    </div>
</body>
</html>`,
        createdAt: '2024-01-25T11:00:00Z',
        updatedAt: '2024-02-05T16:20:00Z',
        createdBy: 'Admin',
      },
    ]

    return {
      success: true,
      data: templates,
    }
  },

  async createTemplate(templateData) {
    await delay(600)

    const newTemplate = {
      id: `template-${Date.now()}`,
      ...templateData,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
    }

    return {
      success: true,
      data: newTemplate,
      message: 'Template created successfully',
    }
  },

  async updateTemplate(id, templateData) {
    await delay(500)

    return {
      success: true,
      data: {
        id,
        ...templateData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Template updated successfully',
    }
  },

  async deleteTemplate(id) {
    await delay(300)

    return {
      success: true,
      message: 'Template deleted successfully',
    }
  },

  async duplicateTemplate(id) {
    await delay(400)

    return {
      success: true,
      message: 'Template duplicated successfully',
      data: {
        id: `template-${Date.now()}`,
        name: 'Copy of Template',
      },
    }
  },

  // Template Versions
  async getTemplateVersions(templateId) {
    await delay(400)

    const versions = [
      {
        id: 'version-1',
        templateId,
        version: '1.2',
        description: 'Updated styling and added new fields',
        createdAt: '2024-02-01T14:30:00Z',
        modifiedBy: 'Admin',
        changes: [
          'Updated font styling',
          'Added signature section',
          'Improved table layout',
          'Fixed margin issues',
        ],
      },
      {
        id: 'version-2',
        templateId,
        version: '1.1',
        description: 'Minor bug fixes and improvements',
        createdAt: '2024-01-20T10:15:00Z',
        modifiedBy: 'Teacher',
        changes: [
          'Fixed alignment issues',
          'Updated color scheme',
          'Added validation',
        ],
      },
      {
        id: 'version-3',
        templateId,
        version: '1.0',
        description: 'Initial template version',
        createdAt: '2024-01-15T10:00:00Z',
        modifiedBy: 'Admin',
        changes: ['Initial template creation'],
      },
    ]

    return {
      success: true,
      data: versions,
    }
  },

  // Utility functions
  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },
}
