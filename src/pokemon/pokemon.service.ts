import { Injectable , BadRequestException , InternalServerErrorException , NotFoundException, Query } from '@nestjs/common';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { UpdatePokemonDto } from '../pokemon/dto/update-pokemon.dto';
import {Model , isValidObjectId} from 'mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import {InjectModel} from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { config } from 'process';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(

    @InjectModel( Pokemon.name )
     private readonly pokemonModel: Model<Pokemon>,

     private readonly configService:ConfigService

    ){

    this.defaultLimit = configService.get<number>('defaultLimit') || 10 ;
    //console.log({ defaultLimit: configService.get<number>('defaultLimit') });

    }

  async create(createPokemonDto: CreatePokemonDto) {
  
    try {
    const pokemon = await this.pokemonModel.create(createPokemonDto);   
    return  pokemon; 
    } catch (error) {
      this.handleExceptions(error);
    }
   
  }

  findAll( paginationDto:PaginationDto ) {

    const {limit = this.defaultLimit , offset = 0} = paginationDto
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({ 
       no:1
    })
    .select('-__v')
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon | null = null;

    if( !isNaN( +term) ){ 
      pokemon = await this.pokemonModel.findOne( { no: +term } );
    }



    if( isValidObjectId( term ) ){ 
      pokemon = await this.pokemonModel.findById(term);
    }

      if( !pokemon ) throw new NotFoundException();

      if(!pokemon) { 
        pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim() })
      }

    return pokemon;


  }



  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
   
    const pokemon = await this.findOne(term);

     if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

     try {
      await pokemon?.updateOne( updatePokemonDto);
       return {...pokemon?.toJSON() , ...updatePokemonDto};

     } catch (error) {
      this.handleExceptions(error);
     }


  }

  async remove(id: string  ) {
      // const pokmeon = await this.findOne(id);
      // await pokmeon?.deleteOne();


    //return {id}

    //const result = await this.pokemonModel.findByIdAndDelete(id)

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    
    if(deletedCount === 0) 
      throw new BadRequestException("Pokemon whit add not found".concat(" ").concat(id));

    return ;
  }


  private handleExceptions(error:any){
     if(error.code === 11000){ 
        throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue) }`);
       }
       console.log(error);
       throw new InternalServerErrorException(`Can't create Pokeom - check server logs`) 

  }


}
