import { parseBuffer } from 'music-metadata';
import { ValidationError, BadRequestError } from '../utils/errors.js';

const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'aac', 'm4a'];
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_DURATION = 5; // seconds
const MAX_DURATION = 300; // 5 minutes
const MIN_SAMPLE_RATE = 44100; // 44.1 kHz

export interface AudioValidationResult {
  format: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  sizeBytes: number;
}

export function validateFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new BadRequestError(
      `Invalid audio format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
    );
  }
  return ext;
}

export function validateMimeType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    throw new BadRequestError(
      `Invalid MIME type '${mimeType}'. Expected an audio file (mp3, wav, aac).`,
    );
  }
}

export function validateFileSize(sizeBytes: number): void {
  if (sizeBytes > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size ${(sizeBytes / (1024 * 1024)).toFixed(1)}MB exceeds maximum of 10MB`,
    );
  }
}

export async function validateAudioContent(buffer: Buffer, filename: string): Promise<AudioValidationResult> {
  const ext = validateFileExtension(filename);
  validateFileSize(buffer.length);

  let metadata;
  try {
    metadata = await parseBuffer(buffer);
  } catch {
    throw new BadRequestError('Unable to parse audio file. Ensure it is a valid audio file.');
  }

  const duration = metadata.format.duration;
  const sampleRate = metadata.format.sampleRate;
  const channels = metadata.format.numberOfChannels;

  if (!duration) {
    throw new BadRequestError('Unable to determine audio duration');
  }

  if (duration < MIN_DURATION) {
    throw new ValidationError(
      `Audio duration ${duration.toFixed(1)}s is below minimum of ${MIN_DURATION}s`,
    );
  }

  if (duration > MAX_DURATION) {
    throw new ValidationError(
      `Audio duration ${duration.toFixed(1)}s exceeds maximum of ${MAX_DURATION}s (5 minutes)`,
    );
  }

  if (sampleRate && sampleRate < MIN_SAMPLE_RATE) {
    throw new ValidationError(
      `Sample rate ${sampleRate}Hz is below minimum of ${MIN_SAMPLE_RATE}Hz`,
    );
  }

  return {
    format: ext,
    durationSeconds: Math.round(duration * 100) / 100,
    sampleRate: sampleRate || MIN_SAMPLE_RATE,
    channels: channels || 1,
    sizeBytes: buffer.length,
  };
}
