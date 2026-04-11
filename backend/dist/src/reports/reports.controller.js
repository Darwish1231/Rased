"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_report_dto_1 = require("./dto/create-report.dto");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async createReport(createReportDto, req) {
        const result = await this.reportsService.createReport(createReportDto, req.user);
        return {
            message: 'Report created successfully',
            data: result,
        };
    }
    async getReports(req) {
        const reports = await this.reportsService.getAllReports(req.user);
        return {
            message: 'Reports retrieved successfully',
            data: reports,
        };
    }
    async getReportDetails(id) {
        const report = await this.reportsService.getReportById(id);
        return {
            message: 'Report details retrieved successfully',
            data: report,
        };
    }
    async updateStatus(id, status, req) {
        const result = await this.reportsService.updateReportStatus(id, status, req.user);
        return result;
    }
    async assignReport(id, assignedToUserId, req) {
        const result = await this.reportsService.assignReport(id, assignedToUserId, req.user);
        return result;
    }
    async addComment(id, note, req) {
        const result = await this.reportsService.addComment(id, note, req.user);
        return result;
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new incident report' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_1.CreateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "createReport", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve reports based on user permissions' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportDetails", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('admin', 'supervisor'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the status of a report' }),
    (0, swagger_1.ApiBody)({ schema: { example: { status: 'resolved' } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, roles_decorator_1.Roles)('admin', 'supervisor'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a report to a user' }),
    (0, swagger_1.ApiBody)({ schema: { example: { assignedToUserId: 'UID' } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('assignedToUserId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "assignReport", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    (0, roles_decorator_1.Roles)('admin', 'supervisor'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a comment to a report' }),
    (0, swagger_1.ApiBody)({ schema: { example: { note: 'Issue has been reviewed' } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('note')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "addComment", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map