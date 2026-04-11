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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStationDto {
    number;
    name;
    region;
    location;
    status;
}
exports.CreateStationDto = CreateStationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ST-01', description: 'Station identification number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Maadi Power Station', description: 'Name of the station' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'South Cairo', description: 'Geographical region' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { lat: 30.123, lng: 31.456 }, description: 'Geographical coordinates' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateStationDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active', enum: ['active', 'inactive'], description: 'Station operational status', required: false }),
    (0, class_validator_1.IsEnum)(['active', 'inactive']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "status", void 0);
//# sourceMappingURL=create-station.dto.js.map